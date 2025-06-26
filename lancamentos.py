from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from src.models.models import db, LancamentosProducao, AreasProducao, Colaboradores, Metas
from src.utils.decorators import can_create_lancamentos

lancamentos_bp = Blueprint('lancamentos', __name__)

@lancamentos_bp.route('/lancamentos', methods=['GET'])
@login_required
def get_lancamentos():
    """Listar lançamentos (administradores veem todos, usuários comuns veem apenas os próprios)"""
    try:
        # Aplicar filtros se fornecidos
        query = LancamentosProducao.query
        
        # Se não for admin, mostrar apenas lançamentos do próprio usuário
        # (Para isso, seria necessário associar lançamentos a usuários - por enquanto, todos podem ver todos)
        
        # Filtros opcionais
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        area_id = request.args.get('area_id')
        colaborador_id = request.args.get('colaborador_id')
        
        if data_inicio:
            try:
                data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                query = query.filter(LancamentosProducao.data >= data_inicio_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data_inicio inválido. Use YYYY-MM-DD'}), 400
        
        if data_fim:
            try:
                data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
                query = query.filter(LancamentosProducao.data <= data_fim_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data_fim inválido. Use YYYY-MM-DD'}), 400
        
        if area_id:
            query = query.filter(LancamentosProducao.area_id == area_id)
        
        if colaborador_id:
            query = query.filter(LancamentosProducao.colaborador_id == colaborador_id)
        
        lancamentos = query.order_by(LancamentosProducao.data.desc()).all()
        return jsonify([lancamento.to_dict() for lancamento in lancamentos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/lancamentos', methods=['POST'])
@can_create_lancamentos
def create_lancamento():
    """Criar novo lançamento"""
    try:
        data = request.get_json()
        
        required_fields = ['data', 'area_id', 'colaborador_id', 'quantidade_realizada']
        for field in required_fields:
            if not data or field not in data:
                return jsonify({'error': f'{field} é obrigatório'}), 400
        
        # Verificar se a área existe
        area = AreasProducao.query.get(data['area_id'])
        if not area:
            return jsonify({'error': 'Área não encontrada'}), 404
        
        # Verificar se o colaborador existe
        colaborador = Colaboradores.query.get(data['colaborador_id'])
        if not colaborador:
            return jsonify({'error': 'Colaborador não encontrado'}), 404
        
        # Converter data
        try:
            data_lancamento = datetime.strptime(data['data'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Verificar se já existe lançamento para este colaborador, área e data
        existing_lancamento = LancamentosProducao.query.filter_by(
            data=data_lancamento,
            area_id=data['area_id'],
            colaborador_id=data['colaborador_id']
        ).first()
        
        if existing_lancamento:
            return jsonify({'error': 'Já existe um lançamento para este colaborador, área e data'}), 400
        
        # Buscar meta vigente para a área
        meta = Metas.query.filter_by(area_id=data['area_id']).first()
        
        # Calcular saldo e valor
        quantidade_realizada = data['quantidade_realizada']
        saldo = 0
        valor_receber = 0
        
        if meta:
            saldo = quantidade_realizada - meta.meta_quantidade
            # Calcular valor proporcional
            if quantidade_realizada >= meta.meta_quantidade:
                # Atingiu a meta: valor base + proporcional ao excesso
                valor_receber = meta.valor_unitario + (saldo * (meta.valor_unitario / meta.meta_quantidade))
            else:
                # Não atingiu a meta: valor proporcional
                valor_receber = (quantidade_realizada / meta.meta_quantidade) * meta.valor_unitario
        
        lancamento = LancamentosProducao(
            data=data_lancamento,
            area_id=data['area_id'],
            colaborador_id=data['colaborador_id'],
            quantidade_realizada=quantidade_realizada,
            saldo=saldo,
            valor_receber=valor_receber
        )
        
        db.session.add(lancamento)
        db.session.commit()
        
        return jsonify(lancamento.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/lancamentos/<int:lancamento_id>', methods=['GET'])
@login_required
def get_lancamento(lancamento_id):
    """Obter lançamento específico"""
    try:
        lancamento = LancamentosProducao.query.get_or_404(lancamento_id)
        return jsonify(lancamento.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/lancamentos/<int:lancamento_id>', methods=['PUT'])
@can_create_lancamentos
def update_lancamento(lancamento_id):
    """Atualizar lançamento"""
    try:
        lancamento = LancamentosProducao.query.get_or_404(lancamento_id)
        data = request.get_json()
        
        # Verificar se a área existe (se fornecida)
        if 'area_id' in data:
            area = AreasProducao.query.get(data['area_id'])
            if not area:
                return jsonify({'error': 'Área não encontrada'}), 404
            lancamento.area_id = data['area_id']
        
        # Verificar se o colaborador existe (se fornecido)
        if 'colaborador_id' in data:
            colaborador = Colaboradores.query.get(data['colaborador_id'])
            if not colaborador:
                return jsonify({'error': 'Colaborador não encontrado'}), 404
            lancamento.colaborador_id = data['colaborador_id']
        
        # Atualizar data (se fornecida)
        if 'data' in data:
            try:
                lancamento.data = datetime.strptime(data['data'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Atualizar quantidade e recalcular valores
        if 'quantidade_realizada' in data:
            lancamento.quantidade_realizada = data['quantidade_realizada']
            
            # Recalcular saldo e valor
            meta = Metas.query.filter_by(area_id=lancamento.area_id).first()
            if meta:
                lancamento.saldo = lancamento.quantidade_realizada - meta.meta_quantidade
                if lancamento.quantidade_realizada >= meta.meta_quantidade:
                    lancamento.valor_receber = meta.valor_unitario + (lancamento.saldo * (meta.valor_unitario / meta.meta_quantidade))
                else:
                    lancamento.valor_receber = (lancamento.quantidade_realizada / meta.meta_quantidade) * meta.valor_unitario
        
        db.session.commit()
        
        return jsonify(lancamento.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/lancamentos/<int:lancamento_id>', methods=['DELETE'])
@can_create_lancamentos
def delete_lancamento(lancamento_id):
    """Deletar lançamento"""
    try:
        lancamento = LancamentosProducao.query.get_or_404(lancamento_id)
        db.session.delete(lancamento)
        db.session.commit()
        
        return jsonify({'message': 'Lançamento deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/relatorios/producao-colaborador', methods=['GET'])
@login_required
def get_relatorio_producao_por_colaborador():
    """Relatório de produção por colaborador"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not data_inicio or not data_fim:
            return jsonify({'error': 'data_inicio e data_fim são obrigatórios'}), 400
        
        try:
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Query para relatório por colaborador
        query = db.session.query(
            Colaboradores.nome.label('colaborador'),
            db.func.sum(LancamentosProducao.quantidade_realizada).label('total_produzido'),
            db.func.avg(LancamentosProducao.quantidade_realizada).label('media_producao'),
            db.func.sum(LancamentosProducao.valor_receber).label('total_valor')
        ).join(
            LancamentosProducao, Colaboradores.id == LancamentosProducao.colaborador_id
        ).filter(
            LancamentosProducao.data >= data_inicio_obj,
            LancamentosProducao.data <= data_fim_obj
        ).group_by(Colaboradores.id, Colaboradores.nome)
        
        resultados = query.all()
        
        relatorio = []
        for resultado in resultados:
            relatorio.append({
                'colaborador': resultado.colaborador,
                'total_produzido': resultado.total_produzido or 0,
                'media_producao': float(resultado.media_producao or 0),
                'total_valor': float(resultado.total_valor or 0)
            })
        
        return jsonify(relatorio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lancamentos_bp.route('/relatorios/producao-area', methods=['GET'])
@login_required
def get_relatorio_producao_por_area():
    """Relatório de produção por área"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not data_inicio or not data_fim:
            return jsonify({'error': 'data_inicio e data_fim são obrigatórios'}), 400
        
        try:
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Query para relatório por área
        query = db.session.query(
            AreasProducao.nome.label('area'),
            db.func.sum(LancamentosProducao.quantidade_realizada).label('total_produzido'),
            db.func.avg(LancamentosProducao.quantidade_realizada).label('media_producao'),
            db.func.sum(LancamentosProducao.valor_receber).label('total_valor')
        ).join(
            LancamentosProducao, AreasProducao.id == LancamentosProducao.area_id
        ).filter(
            LancamentosProducao.data >= data_inicio_obj,
            LancamentosProducao.data <= data_fim_obj
        ).group_by(AreasProducao.id, AreasProducao.nome)
        
        resultados = query.all()
        
        relatorio = []
        for resultado in resultados:
            relatorio.append({
                'area': resultado.area,
                'total_produzido': resultado.total_produzido or 0,
                'media_producao': float(resultado.media_producao or 0),
                'total_valor': float(resultado.total_valor or 0)
            })
        
        return jsonify(relatorio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

