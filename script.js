// Función para crear

function convertTo2SAT(preferences) {
  const n = preferences.length; // Número de personas
  const clauses = []; // Array para almacenar las cláusulas

  // Función auxiliar para crear una variable booleana
  function createVariable(person, partner) {
    const variable = `x${person}${partner}`;
    return variable;
  }

  // Crear variables y cláusulas para garantizar cada persona esté emparejada con exactamente una pareja
  for (let i = 0; i < n; i++) {
    const person = String.fromCharCode(65 + i); // Convertir índice a letra (A, B, C, ...)
    const partners = preferences[i]; // Toma la lista de preferencias de la persona A para i = 0  B para i= 1 Y así
    const partnerXVariables = [];

    for (let j = 0; j < partners.length; j++) {
      const partner = partners[j];
      partnerXVariables.push(createVariable(person, partner));
      // Añadir cláusulas para garantizar que solo una pareja sea verdadera
      for (let k = 0; k < j; k++) {
        clauses.push(`(¬${partnerXVariables[j]} ∨ ¬${partnerXVariables[k]})`);
      }
      const partnerXVariable = createVariable(person, partner);
      const mutualPartnerXVariable = createVariable(partner, person);
      // CREA CLAUSULAS PARA GARANTIZAR DE QUE LAS PAREJAS FINALES SEAN MUTUAS
      clauses.push(`(¬${partnerXVariable} ∨ ${mutualPartnerXVariable})`);
      clauses.push(`(¬${mutualPartnerXVariable} ∨ ${partnerXVariable})`);
    }

    // for (let j = 1; j < partnerXVariables.length; j++) {
    //   clauses.push(`(¬${partnerXVariables[0]} ∨ ¬${partnerXVariables[j]})`);
    // }
    // crea una clausula global para las posibles valores de verdad de cada variable
    clauses.push(`(${partnerXVariables.join(" ∨ ")})`);
  }

  return clauses.join(" ∧ ");
}

// Ingresamos un numero de personas y creamos para cada una una lista de preferencia de compañeros con el resto de las personas
function preferencesGenerator(nPeople) {
  function generatePreferences(N) {
    const people = Array.from({ length: N }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    const preferences = [];

    for (let person of people) {
      const remainingPeople = people.filter((p) => p !== person);
      const shuffledPeople = shuffleArray(remainingPeople);
      preferences.push(shuffledPeople);
    }
    return preferences;
  }
  function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  }

  return generatePreferences(nPeople);
}

// función para dividir las clausulas del string en un array de arrays
function parseClauses(clausesString) {
  const clauses = [];
  const clauseRegex = /\((.*?)\)/g;

  let match;
  while ((match = clauseRegex.exec(clausesString)) !== null) {
    const clause = match[1].split(" ∨ ");
    clauses.push(clause);
  }

  return clauses;
}

// A PRIMA *****************************************************************************************************************
function assignRandomTruthValues(clauses) {
  const variables = new Set();
  // Obtener todas las variables únicas presentes en las cláusulas
  clauses.forEach((clause) => {
    clause.forEach((literal) => {
      const variable = literal.replace("¬", "");
      variables.add(variable);
    });
  });
  const variableArray = Array.from(variables);
  const aPrime = {};
  // Asignar valores de verdad aleatorios a las variables
  variableArray.forEach((variable) => {
    aPrime[variable] = Math.random() < 0.5; // Asignar true o false aleatoriamente
  });
  return aPrime;
}

// Algoritmo de solución para 2-SAT **********************
function rand2SAT(clauses, t, aPrime) {
  const variables = { ...aPrime }; // Copia de aPrime para almacenar las asignaciones de variables
  for (let iteration = 1; iteration <= t; iteration++) {
    // itera para las t iteraciones
    let satisfied = true; // Bandera para verificar si a satisface todas las cláusulas
    let unsatisfiedClauses = clauses.filter((clause) => {
      // se crea un nuevo array de las clausulas que no están satisfechas
      for (const literal of clause) {
        const negacion = literal.startsWith("¬"); // verifica si el literal es una negación de la variable

        const variable = negacion ? literal.slice(1) : literal; // le quita el simbolo de negacio na la variable para compararla con  a*

        if (variables[variable] !== negacion) {
          // si es negación entonces la variable tiene que ser False para que la clausula se cumpla.
          //
          return false; // La cláusula está satisfecha
        }
      }
      return true; // La cláusula no está satisfecha
    });

    if (unsatisfiedClauses.length > 0) {
      const randomClauseIndex = Math.floor(
        // selecciona un indice para escoger una clausula aleatoria
        Math.random() * unsatisfiedClauses.length
      );
      const randomClause = unsatisfiedClauses[randomClauseIndex]; // selecciona la clausula aleatoria
      const randomLiteralIndex = Math.floor(Math.random() * 2);
      const randomLiteral = randomClause[randomLiteralIndex]; // de la clausula selecciona el literal aleatorio 0 o 1
      const negacion = randomLiteral.startsWith("¬");
      const variable = negacion ? randomLiteral.slice(1) : randomLiteral;
      variables[variable] = !negacion; // le cambia el valor de verdad a la variable
      satisfied = false; // se dice que no está satisfecha la formula phi  y se reinicia el proceso
    }
    if (satisfied) {
      return variables; // Retornar la asignación de variables que satisface todas las cláusulas
    }
  }
  return null; // No se encontró una asignación que satisfaga todas las cláusulas dentro del número de iteraciones
}

// /******************************************************************************* */
function solution2sat(isImplementation) {
  const inputValue = isImplementation
    ? document.getElementById("people")
    : document.getElementById("problemInput");
  const preferencesOutput = document.getElementById("preferences");
  const aPrimeOutput = isImplementation
    ? document.getElementById("aPrime")
    : document.getElementById("aPrime2Sat");
  const clausulasOutPut = document.getElementById("clausulas");
  const resultOutput = isImplementation
    ? document.getElementById("result")
    : document.getElementById("result2sat");

  const numberOfPeople = parseInt(inputValue.value);
  const preferences = preferencesGenerator(numberOfPeople);
  const clausulas = convertTo2SAT(preferences);
  const clausulasArray = isImplementation
    ? parseClauses(clausulas)
    : JSON.parse(inputValue.value.replace(/\s+/g, ""));
  const aPrime = assignRandomTruthValues(clausulasArray);
  const t = 2 * Math.pow(Object.keys(aPrime).length, 2);

  const result = rand2SAT(clausulasArray, t, aPrime);

  if (result !== null) {
    let resultValues = "";
    for (let key in result) {
      const value = result[key];
      resultValues += ` ${key}: ${value}<br>`;
      resultOutput.innerHTML =
        "<span>Esta es la solución a la ecuación:</span><br>" + resultValues;
    }
  } else {
    resultOutput.innerHTML =
      "<span>Esta es la solución a la ecuación:</span><br>" +
      "No se encontró solución para la formula dada";
  }

  if (isImplementation) {
    let preferencesText = "";
    for (let i = 0; i < preferences.length; i++) {
      const person = String.fromCharCode(65 + i);
      preferencesText += `${person + ":  " + preferences[i].join(", ")}<br>`;
    }
    preferencesOutput.innerHTML =
      "<span>Esta es la matriz de preferidos:</span><br>" + preferencesText;
    clausulasOutPut.innerHTML =
      "<span>Esta son las clausulas generadas para el numero de personas ingresadas:</span><br>" +
      clausulas;
  }

  let aPrimeValues = "";
  for (let key in aPrime) {
    const value = aPrime[key];
    aPrimeValues += ` ${key}: ${value}<br>`;
  }
  aPrimeOutput.innerHTML = "<span>Esta es aPrime:</span><br>" + aPrimeValues;
}

// const t = 100000;

// const preferences = preferencesGenerator(2);
// console.log("Estas son las preferencias:", preferences);
// const cnfString = convertTo2SAT(preferences);
// const cnfarrays = parseClauses(cnfString);
// console.log(cnfarrays);
// // Run the Rand 2-SAT algorithm
// const aPrime = assignRandomTruthValues(cnfarrays);
// // console.log("esta es la a prima", aPrime);
// const result = rand2SAT(cnfarrays, t, aPrime);
// console.log(cnfString);
// if (result !== null) {
//   console.log("Satisfying assignment found:");
//   console.log(result);
// } else {
//   console.log("No satisfying assignment found within the iterations.");
// }

// // Probando el ejemplo del profesor ***************************************************************************************************

// // probando el codigo
// const clausesTest = [["x1", "x2"]];

// const aPrimeTest = assignRandomTruthValues(clausesTest);

// const tTest = 2 * clausesTest.length ** 2;

// const resultest = rand2SAT(clausesTest, tTest, aPrimeTest);

// if (resultest !== null) {
//   console.log("Satisfying assignment found TEST:");
//   console.log(resultest);
// } else {
//   console.log("No satisfying assignment found within the iterations TEST.");
// }
