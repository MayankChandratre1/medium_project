export const hash = async (data:string, providedSalt?:Uint8Array):Promise<string> => {
   const password = data;
   const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
   const encoder = new TextEncoder();
   const passwordData = encoder.encode(password);
   const saltData = providedSalt || encoder.encode(salt.join(""));
   const keyMaterial = await crypto.subtle.importKey(
     'raw',
     passwordData,
     { name: 'PBKDF2' },
     false,
     ['deriveBits', 'deriveKey']
   );
   const key = await crypto.subtle.deriveKey(
     {
       name: 'PBKDF2',
       salt: saltData,
       iterations: 100000,
       hash: 'SHA-256'
     },
     keyMaterial,
     { name: 'AES-GCM', length: 256 },
     true,
     ['encrypt', 'decrypt']
   );
   const exportedKey = await crypto.subtle.exportKey('raw', key);
   const hashedPassword = new Uint8Array(exportedKey).join("");
   return `${saltData.join(".")}:${hashedPassword}`
}

export const verifyHashedData = async (data: string, hashString:string):Promise<Boolean>=>{
    const [salt, hashedPassword] = hashString.split(":")
    const saltArray = new Uint8Array(salt.split(".").map(b => parseInt(b)))
    const newHashedPassword = await hash(data, saltArray)
    // console.log(newHashedPassword.split(":")[1]+"\n"+hashedPassword);
    return newHashedPassword.split(":")[1] == hashedPassword
}