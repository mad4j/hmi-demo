<template>
  <div class="hmi-shell">
    <header class="bar top-bar">
      <span>HMI Demo</span>
      <span class="status">ONLINE</span>
    </header>

    <main class="content">
      <p>Interfaccia ottimizzata per 800x600 e uso su mezzi mobili.</p>
    </main>

    <footer class="bar bottom-bar">
      <button type="button">Menu</button>
      <button type="button">Allarmi</button>
      <button type="button">Info</button>
    </footer>
  </div>
</template>

<style scoped>
.hmi-shell {
  display: grid;
  grid-template-rows: 4rem 1fr 4.5rem;
  width: 100%;
  height: 100%;
  background: #0f8f3d;
  color: #000;
  border: 2px solid #000;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #1ea84f;
  border-bottom: 2px solid #000;
  font-weight: 700;
}

.bottom-bar {
  border-bottom: 0;
  border-top: 2px solid #000;
  gap: 0.75rem;
}

.status {
  font-size: 0.9rem;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  font-size: 1.05rem;
}

button {
  flex: 1;
  height: 3rem;
  border: 2px solid #000;
  border-radius: 0.4rem;
  background: #3ec665;
  color: #000;
  font-size: 1rem;
  font-weight: 700;
  touch-action: manipulation;
}
</style>
