// Matrix functions ...
const mat = {
    zero(m,n=m) {
        let c = Array(m);
        for (let i=0; i<m; i++)
            c[i] = Array(n).fill(0);
        return c;
    }, 
    copy(a) {
        let n = a.length, c = Array(n);
        for (let i=0; i<n; i++)
            c[i] = [...a[i]];
        return c;
    },
    // mxn
    transpose(a) {
        let i, j, m = a.length, n = a[0].length, c = Array(n), t = Array(m).fill(0);
        for (i=0; i<n; i++) {
            c[i] = [...t];
            for (j=0; j<m; j++)
                c[i][j] = a[j][i];

            }
        return c;
    },
    mult(a,b) {
        let n = b.length;
//        mat.print(a)
        if (a[0].length === n) { // #col of a === #row of b
            let m = a.length, l = b[0].length || 1, c = Array(m), row = Array(l).fill(0);
//            console.log(`n=${n},m=${m},l=${l},c=${c},row=${row}`)
            for (let i=0; i<m; i++) {
                c[i] = [...row];
//                console.log(`c[${i}]=${c[i]}`)
                for (let j=0; j<l; j++)
                    for (let k=0; k<n; k++)
                        c[i][j] += a[i][k]*b[k][j];
            }
//            console.log(`c=${c}`)
            return c;
        }
        return false;
    },
    // nxn !
    inverse(a) {
        let i, j, k, d, n = a.length, c = Array(n), o = Array(n), t = Array(n).fill(0);

        for (i=0; i<n; i++) {
            c[i] = [...a[i]];     // copy rows of 'm'
            o[i] = [...t];        // set elements of 'o' to '0'
            o[i][i] = 1;          // set diagonal elements of 'o' to '1' for initial unit matrix
        }
        for (i=0; i<n; i++) {
            d = c[i][i];      // diagonal element ..
            if (d < Number.EPSILON && d > -Number.EPSILON) { // d nearly zero ..
                let dmax = 0, kmax = i;
                for (k=i+1; k<n; k++)                        // find pivot ...
                    if ((t=Math.abs(c[k][i])) > dmax) {
                        dmax = t;
                        kmax = k;
                    }
                if (dmax > Number.EPSILON) {
                    t = c[i]; c[i] = c[kmax]; c[kmax] = t;  // swap c[i] <-> c[k] ..
                    t = o[i]; o[i] = o[kmax]; o[kmax] = t;  // swap o[i] <-> o[k] ..
                    d = c[i][i];
                }
                else
                    return false;
            }
            for (j=0; j<n; j++) {  // normalize row ..
                c[i][j] /= d;
                o[i][j] /= d;
            }
            for (k=0; k<n; k++) {  // subtract rows ..
                if (k !== i) {
                    t = c[k][i];
                    for (j=0; j<n; j++) {
                        c[k][j] -= t*c[i][j];
                        o[k][j] -= t*o[i][j];
                    }
                }
            }
        }
        return o;
    },
    // see https://de.wikipedia.org/wiki/Pseudoinverse
    leftPseudoInverse(a) {
        let aT = mat.transpose(a); // mat.print(aT);
        return mat.mult(mat.inverse(mat.mult(aT,a)),aT);
    },
    rightPseudoInverse(a) {
        let aT = mat.transpose(a); // mat.print(aT);
        return mat.mult(aT,mat.inverse(mat.mult(a,aT)));
    },
    apply(a,v) {
        let n = v.length;
        if (a[0].length === n) { // #col of a === #row of b
            let m = a.length, o = Array(m).fill(0);
            for (let i=0; i<m; i++)
                for (let j=0; j<n; j++)
                    o[i] += a[i][j]*v[j];
            return o;
        }
        return false;
    },
    gaussSeidelStep(a,q) {
        let n = q.length, dq = Array(n).fill(0);
        for (let i=0; i<n; i++) {
            for (let j=0; j<n; j++)
                dq[i] -= a[i][j]*q[j]/a[i][i];
            q[i] += dq[i];
        }
    },
    print(a) {
        console.log(JSON.stringify(a));
    }
}
