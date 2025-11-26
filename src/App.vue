<template>
  <nav
    v-if="
      !['Login', 'Register', 'Home', 'SobreNosotros', 'Propiedades'].includes(
        $route.name
      )
    "
  >
  </nav>
  <router-view />
</template>
