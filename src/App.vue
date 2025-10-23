<template>
  <nav
    v-if="
      !['Login', 'Register', 'Home', 'SobreNosotros', 'Properties'].includes(
        $route.name
      )
    "
  >
    <router-link to="/">Home</router-link>
  </nav>
  <router-view />
</template>
