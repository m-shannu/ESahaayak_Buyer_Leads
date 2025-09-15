import React from "react";
import EditFormClient from "./EditFormClient";

export default function EditWrapper({ params }: { params: { id: string } }) {
  return <EditFormClient id={params.id} />;
}
