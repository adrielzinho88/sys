from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
from .models import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # 'admin' ou 'user'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        """Define a senha do usuário usando hash seguro"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha fornecida está correta"""
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Verifica se o usuário é administrador"""
        return self.role == 'admin'
    
    def can_manage_metas(self):
        """Verifica se o usuário pode gerenciar metas"""
        return self.role == 'admin'
    
    def can_create_lancamentos(self):
        """Verifica se o usuário pode criar lançamentos"""
        return self.role in ['admin', 'user']
    
    def can_view_all_lancamentos(self):
        """Verifica se o usuário pode ver todos os lançamentos"""
        return self.role == 'admin'
    
    def can_manage_areas(self):
        """Verifica se o usuário pode gerenciar áreas"""
        return self.role == 'admin'
    
    def can_manage_colaboradores(self):
        """Verifica se o usuário pode gerenciar colaboradores"""
        return self.role == 'admin'
    
    def can_manage_observacoes(self):
        """Verifica se o usuário pode gerenciar observações"""
        return self.role == 'admin'
    
    def to_dict(self):
        """Converte o usuário para dicionário (sem senha)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'permissions': {
                'can_manage_metas': self.can_manage_metas(),
                'can_create_lancamentos': self.can_create_lancamentos(),
                'can_view_all_lancamentos': self.can_view_all_lancamentos(),
                'can_manage_areas': self.can_manage_areas(),
                'can_manage_colaboradores': self.can_manage_colaboradores(),
                'can_manage_observacoes': self.can_manage_observacoes()
            }
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

