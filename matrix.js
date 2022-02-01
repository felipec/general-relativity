Array.prototype.sumf = function(f) {
  return this.reduce((m, e, i) => m + f(e, i), 0);
}

// c_ij = a_ik * b_kj
function mul(a, b) {
  if (a[0].length != b.length) throw 'Bad size';
  const c = a.map(_ => new Array());
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      c[i][j] = b.sumf((bk, k) => a[i][k] * bk[j]);
    }
  }
  return c;
}

export { mul };
