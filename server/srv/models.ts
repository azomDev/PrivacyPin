export class Person {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class Ping {
    longitude: number;
    latitude: number;
    timestamp: string;


    constructor(id: string, user_id: string, longitude: number, latitude: number, timestamp: string) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.timestamp = timestamp;
    }
}