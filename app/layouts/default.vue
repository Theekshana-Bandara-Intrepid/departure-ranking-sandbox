<template>
    <div>
        <nav class="nav">
            <span class="brand">Departure Ranking Lab</span>
            <div class="links">
                <NuxtLink to="/">Results</NuxtLink>
                <NuxtLink to="/pipeline">Pipeline</NuxtLink>
                <NuxtLink to="/compare">Rank Shift</NuxtLink>
            </div>
        </nav>
        <main>
            <slot />
        </main>
    </div>
</template>

<style scoped>
.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
}

.brand {
    font-weight: 700;
    font-size: 16px;
}

.links {
    display: flex;
    gap: 20px;
}

.links a {
    font-size: 14px;
    color: #374151;
    text-decoration: none;
}

.links a:hover,
.links .router-link-active {
    color: #1d4ed8;
    font-weight: 600;
}

main {
    min-height: calc(100vh - 57px);
    background: #f9fafb;
}
</style>