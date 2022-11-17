import transition from "./transition";

export enum Direction {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

export function fadeFromVariants(direction: Direction, duration: number, delay: number, travelDistance: number) {
    let baseVariants = {
        initial: {
            opacity: 0,
            x: 0,
            y: 0
        },
        animate: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                ...transition,
                duration: duration,
                delay: delay,
            }
        }
    };

    switch (direction) {
        case Direction.TOP: {
            baseVariants.initial.y = -travelDistance;
            break;
        }

        case Direction.BOTTOM: {
            baseVariants.initial.y = travelDistance;
            break;
        }

        case Direction.LEFT: {
            baseVariants.initial.x = -travelDistance;
            break;
        }

        case Direction.RIGHT: {
            baseVariants.initial.x = travelDistance;
            break;
        }
    }

    return baseVariants
}

export default function fadeFrom(direction: Direction, duration: number, delay: number, travelDistance: number) {
    return {
        variants: fadeFromVariants(direction, duration, delay, travelDistance),
        initial: "initial",
        animate: "animate"
    }
}