const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const bodyParser = require("body-parser");
const { upload } = require("./index.vector-d");
const { checkStringInFile } = require("./helpers/functions");
const sizeOf = require("image-size");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/download", express.static(path.join(__dirname, "download")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/add-url", (req, res) => {
  const { url } = req.body;
  const filePath = "file.txt";
  const newLine = "\n";

  const isHas = checkStringInFile(filePath, url);

  if (!isHas) {
    fs.appendFile(filePath, newLine + url + newLine, (err) => {
      if (err) {
        console.error("Error appending URL to file:", err);
        return res.sendStatus(500);
      }

      console.log("URL added to file:", url);
      upload();
      res.sendStatus(200);
    });
  }

  if (isHas) {
    upload();
    res.sendStatus(200);
  }
});

app.get("/images", (req, res) => {
  let height = parseInt(req.query.height);
  let width = parseInt(req.query.width);
  const folderName = req.query.folder;
  const imgFolder = `download/${folderName}`;

  fs.readdir(imgFolder, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error!");
    }

    const imgs = [];

    files.forEach((file) => {
      const filePath = `${imgFolder}/${file}`;
      imgs.push({
        name: file,
        path: filePath,
      });
    });

    const filteredImgs = [];

    imgs.forEach((img) => {
      const filePath = `${imgFolder}/${img.name}`;
      const dimensions = sizeOf(filePath);
      if (width <= dimensions.width && height <= dimensions.height) {
        filteredImgs.push(img);
      }
      if (!width && !height) {
        filteredImgs.push(img);
      }
    });

    res.render("images", { folderName, imgs: filteredImgs });
  });
});

app.get("/", (req, res) => {
  const downloadFolder = "download";
  const folders = fs.readdirSync(downloadFolder);

  res.render("index", { folders });
});

app.get("/download", (req, res) => {
  let height = parseInt(req.query.height);
  let width = parseInt(req.query.width);

  const output = fs.createWriteStream("archive.zip");
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    console.log("Archive has been successfully created");
    res.download("archive.zip");
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  const folderName = req.query.name;
  const imgFolder = `download/${folderName}`;
  const files = fs.readdirSync(imgFolder);

  files.forEach((file) => {
    const filePath = `${imgFolder}/${file}`;

    const dimensions = sizeOf(filePath);
    if (width <= dimensions.width && height <= dimensions.height) {
      archive.file(filePath, { name: file });
    }
    if (!width && !height) {
      archive.file(filePath, { name: file });
    }
  });

  archive.finalize();
});

app.get("/download/all", (req, res) => {
  const output = fs.createWriteStream("archiveAll.zip");
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    console.log("Archive has been successfully created");
    res.download("archiveAll.zip");
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  const baseDir = "download";

  const traverseDirectory = (dir, archivePath) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const subArchivePath = archivePath ? `${archivePath}/${file}` : file;
        traverseDirectory(filePath, subArchivePath);
      } else {
        archive.file(filePath, {
          name: archivePath ? `${archivePath}/${file}` : file,
        });
      }
    });
  };

  traverseDirectory(baseDir, "");

  archive.finalize();
});

app.listen(3001, () => {
  console.log("Server has been started on 3001 port");
});
