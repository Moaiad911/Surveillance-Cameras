/**
 * @typedef {Object} ICameraRepository
 * @property {(id: string) => Promise<import("../entities/Camera").Camera | null>} findById
 * @property {() => Promise<import("../entities/Camera").Camera[]>} findAll
 * @property {(camera: import("../entities/Camera").Camera) => Promise<import("../entities/Camera").Camera>} create
 * @property {(id: string, camera: Object) => Promise<import("../entities/Camera").Camera | null>} update
 * @property {(id: string) => Promise<boolean>} delete
 */
