window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      alert("Login realizado com sucesso");
    })
    .catch(() => {
      auth.createUserWithEmailAndPassword(email, senha)
        .then(() => {
          alert("Conta criada com sucesso");
        })
        .catch(err => alert(err.message));
    });
};
