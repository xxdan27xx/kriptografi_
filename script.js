// ================= UTIL =================
const charToNum = c => c.toUpperCase().charCodeAt(0) - 64;
const numToChar = n => String.fromCharCode(((n - 1 + 26) % 26) + 65);
const gcd = (a,b)=>b?gcd(b,a%b):a;

// ================= CAESAR =================
function caesar(text, key, mode){
  key = parseInt(key);
  return [...text].map(c=>{
    if(!/[a-z]/i.test(c)) return c;
    let n = charToNum(c) + (mode==="encrypt"?key:-key);
    let r = numToChar(n);
    return c===c.toLowerCase()?r.toLowerCase():r;
  }).join("");
}

// ================= VIGENERE =================
function vigenere(text, key, mode){
  key = key.replace(/\s/g,"");
  let j=0;
  return [...text].map(c=>{
    if(!/[a-z]/i.test(c)) return c;
    let t=charToNum(c);
    let k=charToNum(key[j++%key.length]);
    let n=t+(mode==="encrypt"?k:-k);
    let r=numToChar(n);
    return c===c.toLowerCase()?r.toLowerCase():r;
  }).join("");
}

// ================= HILL =================
function hill(text,m,mode){
  let det=(m[0]*m[3]-m[1]*m[2])%26;
  let inv=[...Array(26).keys()].find(i=>(det*i)%26===1);
  if(inv===undefined) return "❌ Matriks tidak invertible";

  if(mode==="decrypt"){
    m=[m[3]*inv,-m[1]*inv,-m[2]*inv,m[0]*inv]
      .map(x=>((x%26)+26)%26);
  }

  let buf=[],res="";
  for(let c of text){
    if(/[a-z]/i.test(c)){
      buf.push(charToNum(c));
      if(buf.length===2){
        res+=numToChar(m[0]*buf[0]+m[1]*buf[1]);
        res+=numToChar(m[2]*buf[0]+m[3]*buf[1]);
        buf=[];
      }
    } else res+=c;
  }
  return res;
}

// ================= RSA =================
function rsaKeys(p,q){
  let n=p*q,phi=(p-1)*(q-1),e=2;
  while(gcd(e,phi)!==1) e++;
  let d=[...Array(phi).keys()].find(x=>(e*x)%phi===1);
  return {e,d,n};
}
function rsaEncrypt(t,e,n){
  return [...t].map(c=>/[a-z]/i.test(c)?Math.pow(charToNum(c),e)%n:c).join(" ");
}
function rsaDecrypt(t,d,n){
  return t.split(" ").map(c=>isNaN(c)?c:numToChar(Math.pow(+c,d)%n)).join("");
}

// ================= AES =================
const aesEncrypt=(t,k)=>CryptoJS.AES.encrypt(t,k).toString();
const aesDecrypt=(t,k)=>CryptoJS.AES.decrypt(t,k).toString(CryptoJS.enc.Utf8);

// ================= FILE =================
fileInput.addEventListener("change",()=>{
  const file=fileInput.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    inputText.value=e.target.result;
  };
  reader.readAsText(file);
});

// ================= UI =================
function setInfo(txt){
  infoBox.innerHTML="<b>📘 Penjelasan Kunci</b><br>"+txt;
}

function showInputs(){
  keyBox.innerHTML="";
  fileInput.hidden=true;
  inputText.readOnly=false;
  inputText.value="";

  let m=method.value;

  if(m==="Caesar"){
    keyBox.innerHTML=`<input id="key" placeholder="Shift">`;
    setInfo("Shift angka 1–25.<br>Contoh: HELLO + 3 → KHOOR");
  }
  else if(m==="Vigenere"){
    keyBox.innerHTML=`<input id="key" placeholder="Keyword">`;
    setInfo("Keyword huruf A–Z.<br>Contoh: HELLO + KEY → RIJVS");
  }
  else if(m==="Hill"){
    keyBox.innerHTML=`
      <input id="a" placeholder="a">
      <input id="b" placeholder="b"><br>
      <input id="c" placeholder="c">
      <input id="d" placeholder="d">
    `;
    setInfo(`
      Hill Cipher matriks 2×2:<br>
      [ a  b ]<br>
      [ c  d ]<br>
      Contoh valid: a=3, b=3, c=2, d=5
    `);
  }
  else if(m.startsWith("RSA")){
    keyBox.innerHTML=`<input id="p" placeholder="p"><input id="q" placeholder="q">`;
    setInfo("p dan q bilangan prima.<br>Contoh: p=11, q=13");
    if(m.includes("Dokumen")){
      fileInput.hidden=false;
      inputText.readOnly=true;
      setInfo("RSA Dokumen: pilih file .txt");
    }
  }
  else if(m.startsWith("AES")){
    keyBox.innerHTML=`<input id="key" placeholder="16 karakter">`;
    setInfo("AES Key harus 16 karakter.");
    if(m.includes("Dokumen")){
      fileInput.hidden=false;
      inputText.readOnly=true;
      setInfo("AES Dokumen: pilih file .txt");
    }
  }
}

// ================= PROCESS =================
function process(mode){
  let t=inputText.value,m=method.value,o="";
  if(m==="Caesar") o=caesar(t,key.value,mode);
  else if(m==="Vigenere") o=vigenere(t,key.value,mode);
  else if(m==="Hill") o=hill(t,[+a.value,+b.value,+c.value,+d.value],mode);
  else if(m.startsWith("RSA")){
    let {e,d,n}=rsaKeys(+p.value,+q.value);
    o=mode==="encrypt"?rsaEncrypt(t,e,n):rsaDecrypt(t,d,n);
  }
  else if(m.startsWith("AES")){
    o=mode==="encrypt"?aesEncrypt(t,key.value):aesDecrypt(t,key.value);
  }
  outputText.value=o;
}

// ================= DOWNLOAD =================
function downloadResult(){
  let blob=new Blob([outputText.value]);
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="hasil.txt";
  a.click();
}

showInputs();
