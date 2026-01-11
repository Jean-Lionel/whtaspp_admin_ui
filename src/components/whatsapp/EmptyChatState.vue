<template>
  <div class="chat-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-image">
         <!-- Placeholder for WhatsApp web generic img -->
         <svg viewBox="0 0 250 250" width="250" height="250" fill="#e9edef" style="opacity: 0.6"><circle cx="125" cy="125" r="120"/></svg>
      </div>
      <h2>WhatsApp Web</h2>
      <p>Envoyez et recevez des messages sans avoir besoin de garder votre téléphone connecté.</p>
      <p class="encryption-note"><span class="lock-icon">🔒</span> Chiffré de bout en bout</p>
    </div>
  </div>
</template>

<style scoped>
.chat-placeholder {
  flex: 1;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
  border-bottom: 6px solid #25d366; 
}

.placeholder-image {
  margin-bottom: 28px;
}

.chat-placeholder h2 {
  font-weight: 300;
  color: #41525d;
  font-size: 32px;
  margin-bottom: 18px;
}

.chat-placeholder p {
  color: #667781;
  font-size: 14px;
  max-width: 500px;
  line-height: 20px;
  margin-bottom: 30px;
}

.encryption-note {
  font-size: 13px;
  color: #8696a0;
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
