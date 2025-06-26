from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from datetime import datetime
from src.models.models import db
from src.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Rota para fazer login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username e password são obrigatórios'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Buscar usuário no banco
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Usuário inativo'}), 401
        
        # Fazer login do usuário
        login_user(user, remember=True)
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Rota para fazer logout"""
    try:
        logout_user()
        return jsonify({'message': 'Logout realizado com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Rota para obter informações do usuário atual"""
    try:
        return jsonify({
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Rota para verificar se o usuário está autenticado"""
    try:
        if current_user.is_authenticated:
            return jsonify({
                'authenticated': True,
                'user': current_user.to_dict()
            }), 200
        else:
            return jsonify({
                'authenticated': False
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/create-admin', methods=['POST'])
def create_admin():
    """Rota para criar usuário administrador (apenas para setup inicial)"""
    try:
        # Verificar se já existe um admin
        existing_admin = User.query.filter_by(role='admin').first()
        if existing_admin:
            return jsonify({'error': 'Já existe um usuário administrador'}), 400
        
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password') or not data.get('email'):
            return jsonify({'error': 'Username, password e email são obrigatórios'}), 400
        
        # Verificar se username já existe
        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({'error': 'Username já existe'}), 400
        
        # Verificar se email já existe
        existing_email = User.query.filter_by(email=data.get('email')).first()
        if existing_email:
            return jsonify({'error': 'Email já existe'}), 400
        
        # Criar novo usuário admin
        user = User(
            username=data.get('username'),
            email=data.get('email'),
            role='admin'
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário administrador criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

