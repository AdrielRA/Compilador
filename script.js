let input, fileRef, output, outTable, outError, table;

window.onload = () => {
  input = document.getElementById("code");
  fileRef = document.getElementById("file");
  output = document.getElementById("output");
  outError = document.getElementById("error");
  outError.style = "display:none;";
  outTable = document.getElementById("table").getElementsByTagName("tbody")[0];
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
  "%",
];

const isNumber = (word) => Number(word);
const isKeyword = (word) => keywords.includes(word);
const isOperator = (word) => operators.includes(word);
const isString = (word) => word.includes(" ");

const build = () => {
  reset();
  const code = input.value;
  let tokens = [];

  if (!code.length) sendError("Código vazio.");

  code.split(/\n/).map((line, i) => {
    if (line.match(/"/g)?.length % 2)
      sendError(`String inválida na linha [ ${i + 1} ]`);
  });

  let words = code
    .split(/\s|"(.*?)"|([\+\-\/%[\]\{}*(<>)=,!])/)
    .filter((w) => !!w);
  words = joinOperators(words);

  words.forEach((w) => tokens.push(getToken(w)));
  output.textContent = tokens.join(" ");
};

const joinOperators = (words) =>
  words
    .map((w, i) => {
      if (isOperator(w) && isOperator(words[i + 1])) {
        let op = words[i] + words[i + 1];

        if (isOperator(op)) {
          words[i + 1] = undefined;
          return op;
        } else {
          let num = words[i + 1] + words[i + 2];
          if (isNumber(num)) {
            words[i + 1] = num;
            words[i + 2] = undefined;
            return w;
          } else sendError(`Operador ${op} inválido`);
        }
      }
      return w;
    })
    .filter((w) => !!w);

const getToken = (w) =>
  isKeyword(w)
    ? `<${w}>`
    : isNumber(w)
    ? `<num, ${w}>`
    : isOperator(w)
    ? `<op, ${w}>`
    : isString(w)
    ? `<literal, ${w}>`
    : handleId(w);

const handleId = (w) => {
  let index = table.indexOf(w);
  if (index < 0) {
    table.push(w);
    index = table.length - 1;
    var row = outTable.insertRow(outTable.rows.length);
    row.innerHTML = `<td>${index + 1}</td><td>${w}</td>`;
  }
  return `<id, ${index + 1}>`;
};

const reset = () => {
  outError.style = "display:none;";
  output.textContent = "Nada para exibir...";
  outTable.innerHTML = "";
  table = [];
};

const sendError = (err) => {
  outError.style = "display:block;";
  outError.textContent = err;
  throw err;
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
