const fs = require('fs');
const path = require('path');
const events = require('events');
const ROOT = process.cwd();
class FileSystem {
  constructor(file, dir) {
    //this.multiple = file instanceof Array;
    this.file = file;
    this.dir = dir;
  }

  async add(callback) {
    /*
    if(this.multiple) {
      this.file.forEach(file => {
        const serverPath = path.join(this.dir, file.filename);
        await callback(serverPath);
        await this.commit(file);
      });
    }
    */
    //const serverPath = path.join(this.dir, this.file.filename);
    try {
      await callback({
        dir: this.dir,
        uuid: this.file.filename,
        name: this.file.originalname
      });
      await this.commit(
        this.file.path,
        path.join(ROOT, this.dir, this.file.filename)
      );
    } catch(err) {
      this.withdraw();
      throw err;
    }
  }

  async del(callback) {
    const remover = (relativePath, option = {
      nameOnly: false
    }) => {
      const delPath = option.nameOnly ? path.join(this.dir, relativePath) : relativePath;
      this.rm(delPath);
    };
    await callback(remover);
  }

  async commit(tempPath, newPath) {
    try {
      const R = fs.createReadStream(tempPath);
      const W = fs.createWriteStream(newPath);
      R.pipe(W);
      await events.once(W, 'finish');
      fs.existsSync(tempPath) && fs.rmSync(tempPath);
    } catch(err) {
      fs.existsSync(newPath) && fs.rmSync(newPath);
      this.withdraw();
      throw err;
    }
  }

  withdraw() {
    /*
    if(this.multiple) {
      for(const file of this.file) {
        fs.existsSync(file.path) && fs.rmSync(file.path);
      }
    }
    */
    const file = this.file;
    fs.existsSync(file.path) && fs.rmSync(file.path);
  }

  rm(relativePath) {
    const target = path.join(ROOT, relativePath);
    fs.existsSync(target) && fs.rmSync(target);
  }

  rename(oldPath, newPath) {
    fs.existsSync(oldPath) && fs.renameSync(oldPath, newPath);
  }
}
module.exports = FileSystem;
