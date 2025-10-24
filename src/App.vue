<template>
  <nav
    v-if="
      !['Login', 'Register', 'Home', 'SobreNosotros', 'Properties'].includes(
        $route.name
      )
    "
  >
  </nav>
  <router-view />
</template>
