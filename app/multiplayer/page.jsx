"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import MultiplayerMode from "../../components/MultiplayerMode";

export default function Multiplayer() {
  return (
    <ProtectedRoute>
      <MultiplayerMode />
    </ProtectedRoute>
  );
}
