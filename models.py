from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class AreasProducao(db.Model):
    __tablename__ = 'areas_producao'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    
    # Relacionamentos
    metas = db.relationship('Metas', backref='area', lazy=True)
    lancamentos = db.relationship('LancamentosProducao', backref='area', lazy=True)
    
    def __repr__(self):
        return f'<AreasProducao {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome
        }

class Colaboradores(db.Model):
    __tablename__ = 'colaboradores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False, unique=True)
    
    # Relacionamentos
    lancamentos = db.relationship('LancamentosProducao', backref='colaborador', lazy=True)
    observacoes = db.relationship('ObservacoesColaborador', backref='colaborador', lazy=True)
    
    def __repr__(self):
        return f'<Colaboradores {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome
        }

class Metas(db.Model):
    __tablename__ = 'metas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    area_id = db.Column(db.Integer, db.ForeignKey('areas_producao.id'), nullable=False)
    meta_quantidade = db.Column(db.Integer, nullable=False)
    valor_unitario = db.Column(db.Float, nullable=False)
    data_vigencia = db.Column(db.Date, nullable=True)    
    def __repr__(self):
        return f'<Metas {self.nome} - {self.meta_quantidade}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'area_id': self.area_id,
            'area_nome': self.area.nome if self.area else None,
            'meta_quantidade': self.meta_quantidade,
            'valor_unitario': self.valor_unitario,
            'data_vigencia': self.data_vigencia.isoformat() if self.data_vigencia else None
        }

class LancamentosProducao(db.Model):
    __tablename__ = 'lancamentos_producao'
    
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Date, nullable=False)
    area_id = db.Column(db.Integer, db.ForeignKey('areas_producao.id'), nullable=False)
    colaborador_id = db.Column(db.Integer, db.ForeignKey('colaboradores.id'), nullable=False)
    quantidade_realizada = db.Column(db.Integer, nullable=False)
    saldo = db.Column(db.Integer)
    valor_receber = db.Column(db.Float)
    
    def __repr__(self):
        return f'<LancamentosProducao {self.data} - {self.quantidade_realizada}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data.isoformat() if self.data else None,
            'area_id': self.area_id,
            'area_nome': self.area.nome if self.area else None,
            'colaborador_id': self.colaborador_id,
            'colaborador_nome': self.colaborador.nome if self.colaborador else None,
            'quantidade_realizada': self.quantidade_realizada,
            'saldo': self.saldo,
            'valor_receber': self.valor_receber
        }

class ObservacoesColaborador(db.Model):
    __tablename__ = 'observacoes_colaborador'
    
    id = db.Column(db.Integer, primary_key=True)
    colaborador_id = db.Column(db.Integer, db.ForeignKey('colaboradores.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    tipo_observacao = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.Text)
    
    def __repr__(self):
        return f'<ObservacoesColaborador {self.tipo_observacao} - {self.data}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'colaborador_id': self.colaborador_id,
            'colaborador_nome': self.colaborador.nome if self.colaborador else None,
            'data': self.data.isoformat() if self.data else None,
            'tipo_observacao': self.tipo_observacao,
            'descricao': self.descricao
        }

