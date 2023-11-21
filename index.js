const buttonSelectFileElement = document.getElementById("btn-select-file");
const inputFileElement = document.getElementById("file-selector");
const downloadButtonElement = document.getElementById("btn-download-files");

let filesToDownload = [];

function reset() {
  filesToDownload = [];
  buttonSelectFileElement.className = "visible";
  downloadButtonElement.className = "hidden";
}

function downloadFiles() {
  if (filesToDownload.length > 1) {
    var zip = new JSZip();

    filesToDownload.forEach((fileToDownload) => {
      const newFile = new Blob([fileToDownload.file], { type: "text/plain" });

      zip.file(
        `${fileToDownload.filename.replace(".txt", "")}_corrigido.txt`,
        newFile
      );
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
      var url = URL.createObjectURL(content);

      var link = document.createElement("a");
      link.href = url;
      link.download = "arquivos_corrigidos.zip";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  } else {
    const fileToDownload = filesToDownload[0];
    const newFile = new Blob([fileToDownload.file], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(newFile);
    link.download = `${fileToDownload.filename.replace(
      ".txt",
      ""
    )}_corrigido.txt`;
    link.click();
  }

  reset();
}

downloadButtonElement.addEventListener("click", () => {
  downloadFiles();
});

function fixFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function (e) {
      let fileData = e.target.result;

      const fileRows = fileData.split("\n");
      const d100 = "D100";
      const d190 = "D190";

      const newArr = [];

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
          } else {
            newArr[i] = row;
            newArr[i + 1] = impRow;
          }
        } else if (
          ((!rowIsD190 && !previousRowIsD100) ||
            (rowIsD100 && previousRowIsD100) ||
            (rowIsD100 && nextRowIsD100) ||
            (!rowIsD100 && !nextRowIsD100)) &&
          !(rowIsD190 && !nextRowIsD100)
        ) {
          newArr.push(row);
        }
      }

      const fileUpdate = newArr.join("\n");
      filesToDownload.push({ file: fileUpdate, filename: file.name });
    };

    reader.readAsText(file);
  }

  buttonSelectFileElement.className = "hidden";
  downloadButtonElement.className = "visible";
}

buttonSelectFileElement.addEventListener("click", () => {
  inputFileElement.click();
});

inputFileElement.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (files.length <= 0) return;

  fixFiles(files);
});
