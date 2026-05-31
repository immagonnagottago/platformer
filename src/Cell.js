export default class Cell {

    constructor(opts) {

        const mass = opts.mass ?? 100;
        const cohesion = opts.cohesion ?? 50;
        const energy = opts.energy ?? 0;
        const conductivity = opts.conductivity ?? 50;

        this.mass = clamp(mass, MIN_MASS, MAX_MASS);
        this.cohesion = clamp(cohesion, MIN_COHESION, MAX_COHESION);
        this.energy = clamp(energy, MIN_ENERGY, MAX_ENERGY);
        this.conductivity = clamp(conductivity, MIN_CONDUCTIVITY, MAX_CONDUCTIVITY);

        // IMPORTANT: material response property (needed for pressure model)
        this.compressibility = opts.compressibility ?? 1;

        /*
         * Used by simulation scheduling.
         */
        this.lastUpdatedTick = -1;
    }

    clone() {
        return new Cell({
            mass: this.mass,
            cohesion: this.cohesion,
            energy: this.energy,
            conductivity: this.conductivity,
            compressibility: this.compressibility
        });
    }
