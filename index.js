
// dirVisitor: (dir, filenames) => bool(should stop)
// return :
// 0 - all dirs traversed
// 1 - traverse quit during visiting i.e. dirVisitor return: 1, mean dont need to traverse anymore
// -1 - traverse cancelled because of error, either happened when traversing or when visiting
module.exports = function(dir, dirFilter, dirVisitor, options) {
  if (!dir) {
    return -1;
  }
  var stat = fs.statSync(dir);
  if (!stat || !stat.isDirectory()) {
    return -1;
  }
  (options && options.verbose) && console.log('entering dir: ', dir);

  var list = fs.readdirSync(dir);
  list.sort(function(file1, file2) {
    var stats1 = fs.statSync(dir + '/' + file1);
    var stats2 = fs.statSync(dir + '/' + file2);
    if (!stats1) return 1;
    if (!stats2) return -1;
    return stats2.mtime.getTime() - stats1.mtime.getTime();
  });

  var visitRet = 0;
  if (!!(visitRet = dirVisitor(dir, list))) {
    return visitRet;
  }

  var ret = 0;
  var path = '';
  for (var i = 0; i < list.length; i++) {
    path = dir + '/' + list[i];
    stat = fs.statSync(path);
    if (!stat || !stat.isDirectory()) continue;
    if (dirFilter(path)) {
      if (!!(ret = walk(path, dirFilter, dirVisitor))) {
        return ret;
      }
    } else {
      (options && options.verbose) && console.log('ignored dir: ', path);
    }
  }
  return 0;
};
