import {prop, getModelForClass} from '@typegoose/typegoose'


//create our model class
class Inventory {
    @prop({required: true})
    public image?: string;

    @prop({required: true})
    public title?: string;

    @prop({required: true})
    public category?: string;

    @prop({required: true})
    public description?: string;

    @prop({required: true})
    public availability?: number;

}

export const InventoryModel = getModelForClass(Inventory);