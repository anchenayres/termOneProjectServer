import {prop, getModelForClass, Ref} from '@typegoose/typegoose'
import { Inventory } from './inventory';


//create our model class
export class Africa {
    @prop({ ref: Inventory, required: true })
    public africaId?: Ref<Inventory> //links as a reference to our inventory data by ID

    @prop({required: true})
    public _id?: string;

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

export const AfricaModel = getModelForClass(Africa);