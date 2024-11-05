// src/pages/item/[id].js

import dbConnect from "../../lib/mongoose";
import Item from "../../models/Item";
import ItemDetailPage from "../../components/ItemDetail";

function ItemPage({ item }) {
  return <ItemDetailPage item={item} />;
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  await dbConnect();

  try {
    const item = await Item.findById(id).lean();

    if (!item) {
      return {
        props: { item: null },
      };
    }

    // Convert Mongoose _id and Date fields to strings
    item._id = item._id.toString();
    item.createdAt = item.createdAt.toISOString();
    item.updatedAt = item.updatedAt.toISOString();

    return {
      props: { item },
    };
  } catch (error) {
    console.error("Error fetching item:", error);
    return {
      props: { item: null },
    };
  }
}

export default ItemPage;