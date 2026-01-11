<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// Optionnel: vérifier le token au chargement si nécessaire,
// mais le store initialise déjà l'état depuis localStorage.
</script>

<style>
/* Reset global styles if needed, or rely on assets/base.css */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
