import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/login", {
        usuario,
        senha
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuarioTipo", response.data.user.tipo); // <- salvando tipo

      onLogin();
    } catch (error) {
      alert("Erro ao fazer login");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}

export default Login;
