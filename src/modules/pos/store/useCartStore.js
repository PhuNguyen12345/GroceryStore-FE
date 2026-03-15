import { create } from "zustand";

const useCartStore = create((set,get)=>({

  items: [],
  total:0,

  addItem:(product)=>{

    const items = [...get().items];

    const exist = items.find(i=>i.productId===product.id);

    if(exist){
      exist.qty++;
    }else{
      items.push({
        productId:product.id,
        name:product.name,
        price:product.price,
        qty:1
      });
    }

    set({
      items,
      total: items.reduce(
        (t,i)=>t+i.price*i.qty,
        0
      )
    });

  }

}));

export default useCartStore;