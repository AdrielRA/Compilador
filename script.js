let input, fileRef, output, outTable, outError, table;

window.onload = () => {
  input = document.getElementById("code");
  fileRef = document.getElementById("file");
  output = document.getElementById("output");
  outError = document.getElementById("error");
  outError.style = "display:none;";
  outTable = document.getElementById("table").getElementsByTagName("tbody")[0];
};

const onSelectFile = async () => (input.value = await fileRef.files[0].text());

const saveCode = () => {
  const code = input.value;
  if (code.length) {
    let a = document.createElement("a");
    a.href = "data:application/bro," + encodeURIComponent(code);
    a.download = "code.bro";
    a.click();
  }
};

const exportTokens = () => {
  const tokens = output.textContent;
  if (tokens.length && tokens !== "Nada para exibir...") {
    let a = document.createElement("a");
    a.href = "data:application/broto," + encodeURIComponent(tokens);
    a.download = "tokens.broto";
    a.click();
  }
};

const keywords = [
  "algoritmo",
  "declare",
  "numerico",
  "literal",
  "se",
  "entao",
  "senao",
  "fimse",
  "leia",
  "escreva",
  "enquanto",
  "faca",
  "fimalgoritmo",
];

const operators = [
  ">",
  ">=",
  "==",
  "=",
  "<",
  "<=",
  ",",
  "+",
  "-",
  "*",
  "/",
  " %",
  "+=",
  "-=",
  "*=",
  "/=",
  "!=",
  "(",
  ")",
  "++",
  "--",
  "[",
  "]",
  "{",
  "}",
];

const isNumber = (word) => Number(word);
const isOperator = (word) => operators.includes(word);

const buildToken = (word) => {
  let token;

  if (keywords.includes(word)) {
    token = `<${word}>`;
  } else if (isNumber(word)) {
    token = `<num, ${word}>`;
  } else if (isOperator(word)) {
    token = `<op, ${word}>`;
  } else if (word.includes('"')) {
    token = `<literal, ${word}>`;
  } else {
    let index = table.indexOf(word);
    if (index < 0) {
      table.push(word);
      index = table.length - 1;

      var row = outTable.insertRow(outTable.rows.length);
      row.innerHTML = `<td>${index + 1}</td><td>${word}</td>`;
    }
    token = `<id, ${index + 1}>`;
  }
  return token;
};

const writeString = () => {
  outError.style = "display:none;";
  output.textContent = "Nada para exibir...";
  outTable.innerHTML = "";
  table = [];
  const code = input.value;

  if (!code.length) sendError("Código vazio.");

  let words = code.split(
    /\s|(\>)|(\")|(\>=)|(\==)|(\=)|(\<)|(\<=)|(\,)|(\+)|(\-)|(\*)|(\/)|(\%)|(\+=)|(\-=)|(\*=)|(\/=)|(\!=)|(\()|(\))|(\+\+)|(\--)|(\[)|(\])|(\{)|(\})/g
  );
  words = words.filter((w) => !!w);

  let start, end;

  words = words.map((w, i) => {
    // "Velocidade
    // ["""].le
    let count = w.match(/"/g)?.length;
    if (count) {
      if (count === 2) return w;
      else start > 0 ? (end = i) : (start = i);
    }

    if (start && end) {
      let str = words
        .filter((_, index) => index >= start && index <= end)
        .join(" ");
      start = end = undefined;
      return str;
    } else if (!start && !end) return w;
    else {
      if (i === words.length - 1) sendError("String inválida!");
      return undefined;
    }
  });

  words = words.filter((w) => !!w);

  words = joinOperators(words);
  words = words.filter((w) => !!w);

  output.textContent = "";
  let tokens = [];

  words.forEach((w) => tokens.push(buildToken(w)));
  output.textContent += tokens.join(" ");
};
// >=

const joinOperators = (words) => {
  return words.map((w, i) => {
    if (isOperator(w) && isOperator(words[i + 1])) {
      let op = words[i] + words[i + 1];
      words[i + 1] = undefined;

      if (!isOperator(op)) {
        sendError(`Operador ${op} inválido`);
      }
      return op;
    }
    return w;
  });
};

const sendError = (err) => {
  outError.style = "display:block;";
  outError.textContent = err;
  throw err;
};
