from flask import Blueprint, jsonify

# Cria a Blueprint com o nome 'areas_bp'
areas_bp = Blueprint('areas', __name__)

# Rota exemplo: GET /areas
@areas_bp.route('/areas', methods=['GET'])
def listar_areas():
    # Aqui você pode retornar uma lista de áreas, por exemplo
    areas = [
        {"id": 1, "nome": "Área 1"},
        {"id": 2, "nome": "Área 2"},
        {"id": 3, "nome": "Área 3"},
    ]
    return jsonify(areas)
  
