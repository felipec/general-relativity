Array.prototype.sumf = function(f) {
  return this.reduce((m, e, i) => m + f(e, i), 0);
}

// c_ij = b_ik * a_kj
function mul(a, b) {
  if (b[0].length != a.length) throw 'Bad size';
  const c = b.map(_ => new Array());
  for (let i = 0; i < b.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      c[i][j] = a.sumf((ak, k) => b[i][k] * ak[j]);
    }
  }
  return c;
}

export { mul };
