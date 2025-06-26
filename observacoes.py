from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import datetime
from src.models.models import db, ObservacoesColaborador, Colaboradores
from src.utils.decorators import can_manage_observacoes

observacoes_bp = Blueprint('observacoes', __name__)

@observacoes_bp.route('/observacoes', methods=['GET'])
@login_required
def get_observacoes():
    """Listar observações com filtros opcionais"""
    try:
        # Aplicar filtros se fornecidos
        query = ObservacoesColaborador.query
        
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        colaborador_id = request.args.get('colaborador_id')
        tipo_observacao = request.args.get('tipo_observacao')
        
        if data_inicio:
            try:
                data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                query = query.filter(ObservacoesColaborador.data >= data_inicio_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data_inicio inválido. Use YYYY-MM-DD'}), 400
        
        if data_fim:
            try:
                data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
                query = query.filter(ObservacoesColaborador.data <= data_fim_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data_fim inválido. Use YYYY-MM-DD'}), 400
        
        if colaborador_id:
            query = query.filter(ObservacoesColaborador.colaborador_id == colaborador_id)
        
        if tipo_observacao:
            query = query.filter(ObservacoesColaborador.tipo_observacao == tipo_observacao)
        
        observacoes = query.order_by(ObservacoesColaborador.data.desc()).all()
        return jsonify([observacao.to_dict() for observacao in observacoes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@observacoes_bp.route('/observacoes', methods=['POST'])
@can_manage_observacoes
def create_observacao():
    """Criar nova observação (apenas administradores)"""
    try:
        data = request.get_json()
        
        required_fields = ['colaborador_id', 'data', 'tipo_observacao']
        for field in required_fields:
            if not data or field not in data:
                return jsonify({'error': f'{field} é obrigatório'}), 400
        
        # Verificar se o colaborador existe
        colaborador = Colaboradores.query.get(data['colaborador_id'])
        if not colaborador:
            return jsonify({'error': 'Colaborador não encontrado'}), 404
        
        # Converter data
        try:
            data_observacao = datetime.strptime(data['data'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Validar tipo de observação
        tipos_validos = ['férias', 'falta', 'treinamento', 'atestado', 'licença', 'outros']
        if data['tipo_observacao'] not in tipos_validos:
            return jsonify({'error': f'Tipo de observação deve ser um dos seguintes: {", ".join(tipos_validos)}'}), 400
        
        observacao = ObservacoesColaborador(
            colaborador_id=data['colaborador_id'],
            data=data_observacao,
            tipo_observacao=data['tipo_observacao'],
            descricao=data.get('descricao', '')
        )
        
        db.session.add(observacao)
        db.session.commit()
        
        return jsonify(observacao.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@observacoes_bp.route('/observacoes/<int:observacao_id>', methods=['GET'])
@login_required
def get_observacao(observacao_id):
    """Obter observação específica"""
    try:
        observacao = ObservacoesColaborador.query.get_or_404(observacao_id)
        return jsonify(observacao.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@observacoes_bp.route('/observacoes/<int:observacao_id>', methods=['PUT'])
@can_manage_observacoes
def update_observacao(observacao_id):
    """Atualizar observação (apenas administradores)"""
    try:
        observacao = ObservacoesColaborador.query.get_or_404(observacao_id)
        data = request.get_json()
        
        # Verificar se o colaborador existe (se fornecido)
        if 'colaborador_id' in data:
            colaborador = Colaboradores.query.get(data['colaborador_id'])
            if not colaborador:
                return jsonify({'error': 'Colaborador não encontrado'}), 404
            observacao.colaborador_id = data['colaborador_id']
        
        # Atualizar data (se fornecida)
        if 'data' in data:
            try:
                observacao.data = datetime.strptime(data['data'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Atualizar tipo de observação (se fornecido)
        if 'tipo_observacao' in data:
            tipos_validos = ['férias', 'falta', 'treinamento', 'atestado', 'licença', 'outros']
            if data['tipo_observacao'] not in tipos_validos:
                return jsonify({'error': f'Tipo de observação deve ser um dos seguintes: {", ".join(tipos_validos)}'}), 400
            observacao.tipo_observacao = data['tipo_observacao']
        
        # Atualizar descrição (se fornecida)
        if 'descricao' in data:
            observacao.descricao = data['descricao']
        
        db.session.commit()
        
        return jsonify(observacao.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@observacoes_bp.route('/observacoes/<int:observacao_id>', methods=['DELETE'])
@can_manage_observacoes
def delete_observacao(observacao_id):
    """Deletar observação (apenas administradores)"""
    try:
        observacao = ObservacoesColaborador.query.get_or_404(observacao_id)
        db.session.delete(observacao)
        db.session.commit()
        
        return jsonify({'message': 'Observação deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500