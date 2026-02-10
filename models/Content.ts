// app/models/Content.ts
import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema(
  {
    // 🎬 Basic Info
    type: { type: String, required: true }, // "movie" | "series"
    title: { type: String, required: true },
    description: String,
    poster: String,
    publicId: String,
    landscapePoster: String,
    landscapePublicId: String,

    // 📅 Metadata
    year: Number,
    genre: String,
    rating: Number,
    duration: String, // e.g. "2h 10m"
    episodes: Number, // only for series
    country: String,
    ageRating: { type: String, default: "13+" }, // 🔥 new field (iQIYI/Netflix style)
    releaseDate: Date, // for Coming Soon / schedule
    cast: [{ type: String }],
    tags: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    popularityRank: { type: Number, default: null },

    heroBg: String,
    heroBgPublicId: String,
    heroCharacter: String,
    heroCharacterPublicId: String,
    heroTitle: String,
    heroTitlePublicId: String,

    // 📦 Content visibility
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// ⚡ Index optimization for faster filtering/sorting
contentSchema.index({ isPopular: 1, popularityRank: 1 });

export default mongoose.models.Content ||
  mongoose.model("Content", contentSchema);
