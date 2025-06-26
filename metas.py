from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import datetime
from src.models.models import db, Metas, AreasProducao
from src.utils.decorators import can_manage_metas

metas_bp = Blueprint('metas', __name__)

@metas_bp.route('/metas', methods=['GET'])
@login_required
def get_metas():
    """Listar todas as metas"""
    try:
        metas = Metas.query.all()
        return jsonify([meta.to_dict() for meta in metas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@metas_bp.route('/metas', methods=['POST'])
@can_manage_metas
def create_meta():
    """Criar nova meta (apenas administradores)"""
    try:
        data = request.get_json()
        
        required_fields = ['nome', 'area_id', 'meta_quantidade', 'valor_unitario']
        for field in required_fields:
            if not data or field not in data:
                return jsonify({'error': f'{field} é obrigatório'}), 400
        
        # Verificar se a área existe
        area = AreasProducao.query.get(data['area_id'])
        if not area:
            return jsonify({'error': 'Área não encontrada'}), 404
        
        # Converter data_vigencia se fornecida
        data_vigencia = None
        if 'data_vigencia' in data and data['data_vigencia']:
            try:
                data_vigencia = datetime.strptime(data['data_vigencia'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        meta = Metas(
            nome=data['nome'],
            area_id=data['area_id'],
            meta_quantidade=data['meta_quantidade'],
            valor_unitario=data['valor_unitario'],
            data_vigencia=data_vigencia
        )
        
        db.session.add(meta)
        db.session.commit()
        
        return jsonify(meta.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@metas_bp.route('/metas/<int:meta_id>', methods=['GET'])
@login_required
def get_meta(meta_id):
    """Obter meta específica"""
    try:
        meta = Metas.query.get_or_404(meta_id)
        return jsonify(meta.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@metas_bp.route('/metas/<int:meta_id>', methods=['PUT'])
@can_manage_metas
def update_meta(meta_id):
    """Atualizar meta (apenas administradores)"""
    try:
        meta = Metas.query.get_or_404(meta_id)
        data = request.get_json()
        
        if 'nome' in data:
            meta.nome = data['nome']
        
        if 'area_id' in data:
            area = AreasProducao.query.get(data['area_id'])
            if not area:
                return jsonify({'error': 'Área não encontrada'}), 404
            meta.area_id = data['area_id']
        
        if 'meta_quantidade' in data:
            meta.meta_quantidade = data['meta_quantidade']
        
        if 'valor_unitario' in data:
            meta.valor_unitario = data['valor_unitario']
        
        if 'data_vigencia' in data and data['data_vigencia']:
            try:
                meta.data_vigencia = datetime.strptime(data['data_vigencia'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        db.session.commit()
        
        return jsonify(meta.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@metas_bp.route('/metas/<int:meta_id>', methods=['DELETE'])
@can_manage_metas
def delete_meta(meta_id):
    """Deletar meta (apenas administradores)"""
    try:
        meta = Metas.query.get_or_404(meta_id)
        db.session.delete(meta)
        db.session.commit()
        
        return jsonify({'message': 'Meta deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@metas_bp.route('/metas/area/<int:area_id>', methods=['GET'])
@login_required
def get_metas_by_area(area_id):
    """Obter metas por área"""
    try:
        metas = Metas.query.filter_by(area_id=area_id).all()
        return jsonify([meta.to_dict() for meta in metas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

