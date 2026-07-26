Create a prompt for CoPilot to design better 3D procedural models for two items in our Three.js merge game — a golf ball and a snorkel mask. These are built from Three.js primitives only (no external models or textures).

**Current golf ball**: A white sphere (radius 0.35, 24 segments) with thin cross-hatch lines on the surface. It looks like a plain ball — we want recognizable golf ball dimples.

**Current snorkel mask**: A cyan torus ring (lens frame), two blue semi-transparent oval lenses inside, and a dark strap behind it. It's recognizable as a mask but lacks polish.

Requirements for the replacement `buildTierMesh(tier)` function:
1. Still returns a `THREE.Group` with `g.userData.radius` set
2. Uses only Three.js primitive geometries (SphereGeometry, BoxGeometry, TorusGeometry, CylinderGeometry, ConeGeometry, TorusKnotGeometry)
3. Must call `mesh.castShadow = true` on main structural meshes
4. The golf ball should have visible dimple-like indentations using small spheres placed on the surface in a hexagonal/pentagonal pattern
5. The snorkel mask should have a more realistic frame shape with a curved bridge between the lenses and visible side straps
6. Keep the same 0.35 radius
7. Code must be compact — use concise variable names, no unnecessary comments
8. Use `const mat = new THREE.MeshStandardMaterial({ color, roughness: ..., metalness: ... })` pattern
9. Each tier is one `case` in a `switch(tier)` block within `buildTierMesh(tier)`

Provide the complete replacement code for `case 0:` (golf ball) and `case 1:` (snorkel mask) of the switch statement.
