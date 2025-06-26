from flask import Blueprint, request, jsonify
from flask_login import login_required
from src.models.models import db, Colaboradores
from src.utils.decorators import can_manage_colaboradores

colaboradores_bp = Blueprint('colaboradores', __name__)

@colaboradores_bp.route('/colaboradores', methods=['GET'])
@login_required
def get_colaboradores():
    """Listar todos os colaboradores"""
    try:
        colaboradores = Colaboradores.query.all()
        return jsonify([colaborador.to_dict() for colaborador in colaboradores]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colaboradores_bp.route('/colaboradores', methods=['POST'])
@can_manage_colaboradores
def create_colaborador():
    """Criar novo colaborador (apenas administradores)"""
    try:
        data = request.get_json()
        
        if not data or 'nome' not in data:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Verificar se já existe um colaborador com esse nome
        existing_colaborador = Colaboradores.query.filter_by(nome=data['nome']).first()
        if existing_colaborador:
            return jsonify({'error': 'Já existe um colaborador com esse nome'}), 400
        
        colaborador = Colaboradores(nome=data['nome'])
        db.session.add(colaborador)
        db.session.commit()
        
        return jsonify(colaborador.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@colaboradores_bp.route('/colaboradores/<int:colaborador_id>', methods=['GET'])
@login_required
def get_colaborador(colaborador_id):
    """Obter colaborador específico"""
    try:
        colaborador = Colaboradores.query.get_or_404(colaborador_id)
        return jsonify(colaborador.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colaboradores_bp.route('/colaboradores/<int:colaborador_id>', methods=['PUT'])
@can_manage_colaboradores
def update_colaborador(colaborador_id):
    """Atualizar colaborador (apenas administradores)"""
    try:
        colaborador = Colaboradores.query.get_or_404(colaborador_id)
        data = request.get_json()
        
        if not data or 'nome' not in data:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Verificar se já existe outro colaborador com esse nome
        existing_colaborador = Colaboradores.query.filter_by(nome=data['nome']).first()
        if existing_colaborador and existing_colaborador.id != colaborador_id:
            return jsonify({'error': 'Já existe um colaborador com esse nome'}), 400
        
        colaborador.nome = data['nome']
        db.session.commit()
        
        return jsonify(colaborador.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@colaboradores_bp.route('/colaboradores/<int:colaborador_id>', methods=['DELETE'])
@can_manage_colaboradores
def delete_colaborador(colaborador_id):
    """Deletar colaborador (apenas administradores)"""
    try:
        colaborador = Colaboradores.query.get_or_404(colaborador_id)
        
        # Verificar se existem lançamentos ou observações associados
        if colaborador.lancamentos or colaborador.observacoes:
            return jsonify({'error': 'Não é possível deletar colaborador que possui lançamentos ou observações associados'}), 400
        
        db.session.delete(colaborador)
        db.session.commit()
        
        return jsonify({'message': 'Colaborador deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500