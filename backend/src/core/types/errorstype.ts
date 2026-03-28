import types from "mongoose"


export type errorstype = {
  message: string;
  sucess: boolean;
  errors?: Array<{ field?: string; message: string }>;
};
