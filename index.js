const fs = require("fs").promises;

const readTxts = async () => {
  try {
    const dir = "./SpedsTxt";
    const files = await fs.readdir(dir, "utf8");

    files.forEach(async (path) => {
      const fullPath = `${dir}/${path}`; // -> "./txts/TESTESPED.tsx"
      const file = await fs.readFile(fullPath, "utf-8");
      const fileRows = file.split("\n");

      const d100 = "D100";
      const d190 = "D190";

      const newArr = [];

      const cianoColor = "\x1b[33m";
      const texto = "%s";
      const reset = "\x1b[0m";
      const optionsTitle = `${cianoColor}${texto}${reset}`;

      console.log(optionsTitle, `\n Alterações do Arquivo '${path}': \n`);

      for (let i = 0; i < fileRows.length; i++) {
        const row = fileRows[i];
        const previousRow = fileRows[i - 1];
        const nextRow = fileRows[i + 1];

        const previousRowIsD100 = previousRow?.split("|")[1] === d100;
        const rowIsD100 = row?.split("|")[1] === d100; // |D100|.split("|") -> ["", "D100", ]
        const rowIsD190 = row?.split("|")[1] === d190;
        const nextRowIsD100 = nextRow?.split("|")[1] === d100;
        const nextRowIsD190 = nextRow?.split("|")[1] === d190;

        if (rowIsD100 && nextRowIsD190) {
          const noteRow = row; // |D100|1|0|SA1C0190001|57|00|0||549|12230904884082002855570000000005491000005490|12092023|12092023|0||41,67|0|9|41,67|41,67|5|0||311010000000001|1200401|2910727|
          const impRow = nextRow;
          const noteRowArray = noteRow.split("|"); // ["D100", "", "0", "SA1C0190001", ...]
          const impRowArray = impRow.split("|");
          const baseCalculation = noteRowArray[19];

          if (baseCalculation !== "0") {
            const noteColumn15 = noteRowArray[15];
            const noteColumn18 = noteRowArray[18];
            const impColumn5 = impRowArray[5];
            const impColumn6 = impRowArray[6];

            // change noteRow -> 18 -> 15
            noteRowArray[15] = baseCalculation;
            noteRowArray[18] = baseCalculation;

            // change impRow -> 5 -> 6
            impRowArray[5] = baseCalculation;
            impRowArray[6] = baseCalculation;

            // Recriar as row com os valores atualizados
            const newNoteRow = noteRowArray.join("|");
            const newImpRow = impRowArray.join("|");

            newArr[i] = newNoteRow;
            newArr[i + 1] = newImpRow;

            if (
              noteColumn15 !== baseCalculation ||
              noteColumn18 !== baseCalculation ||
              impColumn5 !== baseCalculation ||
              impColumn6 !== baseCalculation
            ) {
              const oldColor = "\x1b[41m";
              const changedColor = "\x1b[42m";
              const texto = "%s";
              const reset = "\x1b[0m";
              const optionsOld = `${oldColor}${texto}${reset}`;
              const optionsChanged = `${changedColor}${texto}${reset}`;

              console.log(optionsOld, `${i + 1} - ${noteRow}`);
              console.log(optionsOld, `${i + 2} - ${impRow}`);
              console.log(optionsChanged, `${i + 1} + ${newNoteRow}`);
              console.log(optionsChanged, `${i + 2} + ${newImpRow}`);
              console.log("\n")
            }
          } else {
            newArr[i] = row;
            newArr[i + 1] = impRow;
          }
        } else if (
          (!rowIsD190 && !previousRowIsD100) ||
          (rowIsD100 && previousRowIsD100) ||
          (rowIsD100 && nextRowIsD100) ||
          (!rowIsD100 && !nextRowIsD100)
        ) {
          newArr.push(row);
        }
      }

      const fileUpdate = newArr.join("\n");
      await fs.writeFile(fullPath, fileUpdate);
    });

    console.log("Sistema executado com sucesso! \n");
  } catch (error) {
    console.error("Failed: ", error);
  }
};

readTxts();