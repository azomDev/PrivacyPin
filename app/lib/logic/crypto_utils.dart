class CryptoUtils {
  static String generateSigningKeyPair() {
    //? put the logic in kotlin?
    // generates a new key pair using dilithium, saves the private key directly and returns the public key
    return "temp";
  }

  static String generateLocationKey() {
    //? put the logic in kotlin?
    // generates a new AES key for encrypting pings
    return "temp";
  }

  static String sign(String data) {
    //? put the logic in kotlin?
    // sign data using stored private signing key using dilithium and return the signature
  }

  static String encrypt(String data, String secret_key) {
    //? put the logic in kotlin?
    // encrypt data using the secret_key using AES
  }

  static String decrypt(String encrypted_data, String secret_key) {
    //? put the logic in kotlin?
    // decrypt data using the secret_key using AES
  }
}
