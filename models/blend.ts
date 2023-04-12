import { prop, getModelForClass } from '@typegoose/typegoose';

class Blend {

    @prop({required: true})
    public name?: string

    @prop()
    public image?: string

    @prop()
    public description?: string

    @prop()
    public amount?: number

    //array of all ingredients needed from inventory
    @prop()
    public ingredients?: []


}

export const BlendModel = getModelForClass(Blend);