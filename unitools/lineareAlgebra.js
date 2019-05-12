function Polynom (){
	// charakteristik des Polynoms
		this.char = c || 1;
	// speichere die Faktoren für das Polynom folgendermaßen:
	// f[0]*T^0 + f[1]*T^1 + f[2]*T^2 + ...
		this.f = [];
}

// reset all faktors of the polynomial in a specific fiel back to its standard representative
	const stdrep = (f, c) => this.f.map( x => x>=0?x%c:x%c+c )
// inversion operations
	// invert a polynomial under addition
	const addinv = (p)=>p.map(k=>-k);
// arithmetik von Polynomen
	const add = (p) => {
		let m = p.sort((a,b)=>b.length-a.length);
		m.forEach( (q,i)=>{
			if(i!=0){
				q.forEach( (r,j)=>{
					m[0][j]+=m[i][j]
				})
			}
		});
		return m[0];
	}
	const sub = (p) => add(p.map( (q,i)=>i!=0?addinv(q):q ));
	const mul = (p) =>{
		// define multiplication of polynomials by a polynomial with only one variable)
		const single = (p,k,s)=>{
			// multiply polynomial p by a polinomial q(T)= k*T^s
			let pre = new Array(s).fill(0);
			p = p.map( t => k*t )
			return pre.concat(p);
		}
		// create an empty polynomial, to which all part sums of the result will be added to
		let m = [];
		// traverse each summand of each polynomial and multiply it with each other polynomial
		for (var i=0; i<p.length; i++) {
			for (var s=0; s<p[i].length; s++) {
				for (var j=i+1; j<p.length; j++) {
					m = add([m, single(p[j],p[i][s],s)]);
				}
			}
		}
		return m;
	}
	const div = (p1,q1, result=[])=>{
		if(p1.length>=q1.length){
			let kp = p1[p1.length-1];
			let sp = p1.length;
			let kq = q1[q1.length-1];
			let sq = q1.length;

			let sdiff = sp-sq;
			let kdiff = kp/kq;
			//console.log([[kp,sp],[kq,sq]],kdiff, sdiff);

			let partres =  new Array(sdiff).fill(0).concat( [kdiff] );
			//console.log(partres);

			let newp = add([p1,addinv(mul([q1,partres]))]);
			//newp.shift();
			newp = newp.splice(0,newp.length-1);
			//console.log(newp);
			//console.log(result, partres);
			return div(newp, q1, add([result,partres]));
		}
		else{
			return [result,p1];
		}
	};

	const polynom2text = (p)=>p.map((k,i)=>k+"x^"+i).reverse().join("+");
	const polynom2html = (p)=>"<span>"+p.map((k,i)=>`${k}x<sup>${i}</sup>`).reverse().join("+")+"</span>";

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
