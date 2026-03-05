import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUnitDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsNumber()
    @IsNotEmpty()
    year: number;

    @IsString()
    @IsNotEmpty()
    serial_number: string;

    @IsString()
    @IsNotEmpty()
    license_plate: string;
}