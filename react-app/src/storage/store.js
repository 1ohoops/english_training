import { createStore } from "redux";
import all_reducers from "./reducer";

export default createStore(all_reducers)