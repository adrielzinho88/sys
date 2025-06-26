from flask import Blueprint, request, jsonify
from flask_login import login_required
from src.models.models import db, AreasProducao
from src.utils.decorators import can_manage_areas

areas_bp = Blueprint('areas', __name__)

@areas_bp.route('/areas', methods=['GET'])
@login_required
def get_areas():
    """Listar todas as áreas"""
    try:
        areas = AreasProducao.query.all()
        return jsonify([area.to_dict() for area in areas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@areas_bp.route('/areas', methods=['POST'])
@can_manage_areas
def create_area():
    """Criar nova área (apenas administradores)"""
    try:
        data = request.get_json()
        
        if not data or 'nome' not in data:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Verificar se já existe uma área com esse nome
        existing_area = AreasProducao.query.filter_by(nome=data['nome']).first()
        if existing_area:
            return jsonify({'error': 'Já existe uma área com esse nome'}), 400
        
        area = AreasProducao(nome=data['nome'])
        db.session.add(area)
        db.session.commit()
        
        return jsonify(area.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@areas_bp.route('/areas/<int:area_id>', methods=['GET'])
@login_required
def get_area(area_id):
    """Obter área específica"""
    try:
        area = AreasProducao.query.get_or_404(area_id)
        return jsonify(area.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@areas_bp.route('/areas/<int:area_id>', methods=['PUT'])
@can_manage_areas
def update_area(area_id):
    """Atualizar área (apenas administradores)"""
    try:
        area = AreasProducao.query.get_or_404(area_id)
        data = request.get_json()
        
        if not data or 'nome' not in data:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Verificar se já existe outra área com esse nome
        existing_area = AreasProducao.query.filter_by(nome=data['nome']).first()
        if existing_area and existing_area.id != area_id:
            return jsonify({'error': 'Já existe uma área com esse nome'}), 400
        
        area.nome = data['nome']
        db.session.commit()
        
        return jsonify(area.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@areas_bp.route('/areas/<int:area_id>', methods=['DELETE'])
@can_manage_areas
def delete_area(area_id):
    """Deletar área (apenas administradores)"""
    try:
        area = AreasProducao.query.get_or_404(area_id)
        
        # Verificar se existem metas ou lançamentos associados
        if area.metas or area.lancamentos:
            return jsonify({'error': 'Não é possível deletar área que possui metas ou lançamentos associados'}), 400
        
        db.session.delete(area)
        db.session.commit()
        
        return jsonify({'message': 'Área deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500