from functools import wraps
from flask import jsonify
from flask_login import current_user, login_required

def admin_required(f):
    """Decorator que requer que o usuário seja administrador"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin():
            return jsonify({'error': 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def can_manage_metas(f):
    """Decorator que verifica se o usuário pode gerenciar metas"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.can_manage_metas():
            return jsonify({'error': 'Acesso negado. Você não tem permissão para gerenciar metas.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def can_create_lancamentos(f):
    """Decorator que verifica se o usuário pode criar lançamentos"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.can_create_lancamentos():
            return jsonify({'error': 'Acesso negado. Você não tem permissão para criar lançamentos.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def can_manage_areas(f):
    """Decorator que verifica se o usuário pode gerenciar áreas"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.can_manage_areas():
            return jsonify({'error': 'Acesso negado. Você não tem permissão para gerenciar áreas.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def can_manage_colaboradores(f):
    """Decorator que verifica se o usuário pode gerenciar colaboradores"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.can_manage_colaboradores():
            return jsonify({'error': 'Acesso negado. Você não tem permissão para gerenciar colaboradores.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def can_manage_observacoes(f):
    """Decorator que verifica se o usuário pode gerenciar observações"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.can_manage_observacoes():
            return jsonify({'error': 'Acesso negado. Você não tem permissão para gerenciar observações.'}), 403
        return f(*args, **kwargs)
    return decorated_function

