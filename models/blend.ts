import { prop, getModelForClass } from '@typegoose/typegoose';
import {Ingredient} from './ingredient';

//Armand RECIPE.TS

export class Blend {

    @prop({required: true})
    public name?: string

    @prop()
    public image?: string

    @prop()
    public description?: string

    @prop()
    public availability?: number

    //array of all ingredients needed from inventory
    @prop({type: () => [Ingredient], required: true})
    public ingredients?: Ingredient[]


}

export const BlendModel = getModelForClass(Blend);