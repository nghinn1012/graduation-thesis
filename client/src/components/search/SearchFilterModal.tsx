import React, { useEffect, useState } from 'react';
import { Range } from 'react-range';
import { useSearchContext } from '../../context/SearchContext';
import { useI18nContext } from '../../hooks/useI18nContext';

interface Filters {
  cookingTimeRange: [number, number];
  minQuality: number;
  difficulty: string[];
  haveMade: boolean;
  hashtags: string[];
  timeOrder?: number;
  qualityOrder?: number;
}

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

interface DifficultyState {
  easy: boolean;
  medium: boolean;
  hard: boolean;
}

const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {
    cookingTimeRange: [0, 1440],
    minQuality: 0,
    difficulty: [],
    haveMade: false,
    hashtags: []
  }
}) => {
  const [localCookingTimeRange, setLocalCookingTimeRange] = useState<[number, number]>(initialFilters.cookingTimeRange ?? [0, 1440]);
  const [rating, setRating] = useState<number>(initialFilters.minQuality ?? 0);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyState>({
    easy: initialFilters.difficulty?.includes("easy") ?? false,
    medium: initialFilters.difficulty?.includes("medium") ?? false,
    hard: initialFilters.difficulty?.includes("hard") ?? false,
  });
  const [hashtags, setHashtags] = useState<string[]>(initialFilters.hashtags ?? []);
  const [hashtagInput, setHashtagInput] = useState<string>("");
  const [haveMadeOn, setHaveMadeOn] = useState<boolean>(initialFilters.haveMade ?? false);
  const language = useI18nContext();
  const lang = language.of("RightPanel");
  useEffect(() => {
    if (isOpen) {
      setLocalCookingTimeRange(initialFilters.cookingTimeRange ?? [0, 1440]);
      setRating(initialFilters.minQuality ?? 0);
      setHaveMadeOn(initialFilters.haveMade ?? false);
      setSelectedDifficulties({
        easy: initialFilters.difficulty?.includes("easy") ?? false,
        medium: initialFilters.difficulty?.includes("medium") ?? false,
        hard: initialFilters.difficulty?.includes("hard") ?? false,
      });
      setHashtags(initialFilters.hashtags ?? []);
    }
  }, [isOpen, initialFilters]);

  const handleHashtagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && hashtagInput.trim() !== "") {
      setHashtags(prev => [...prev, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string): void => {
    setHashtags(prev => prev.filter(hashtag => hashtag !== hashtagToRemove));
  };

  const handleCheckboxChange = (name: keyof DifficultyState, checked: boolean): void => {
    setSelectedDifficulties(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleInputChange = (index: 0 | 1, value: string): void => {
    const newCookingTimeRange: [number, number] = [...localCookingTimeRange];
    newCookingTimeRange[index] = value === "" ? 0 : Number(value);
    setLocalCookingTimeRange(newCookingTimeRange);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hoursText = hours > 0 ? `${hours}h` : "";
    const minsText = mins > 0 ? `${mins}m` : "";
    return `${hoursText} ${minsText}`.trim();
  };

  const handleApplyFilters = (): void => {
    const difficulties = Object.entries(selectedDifficulties)
      .filter(([_, isSelected]) => isSelected)
      .map(([difficulty]) => difficulty);

    onApplyFilters({
      cookingTimeRange: localCookingTimeRange,
      minQuality: rating,
      difficulty: difficulties,
      haveMade: haveMadeOn,
      hashtags
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{lang("search-filter")}</h2>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-6">
          {/* Cooking Time Range */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              {lang("cooking-time")}
            </label>
            <Range
              step={1}
              min={0}
              max={1440}
              values={localCookingTimeRange}
              onChange={(newRange: number[]) => setLocalCookingTimeRange(newRange as [number, number])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className="h-1 w-full bg-gray-200 rounded-full"
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  className="h-5 w-5 rounded-full bg-primary"
                />
              )}
            />

            <div className="flex justify-between mt-2">
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  placeholder="From"
                  className="input input-bordered input-sm w-20"
                  value={localCookingTimeRange[0]}
                  onChange={(e) => handleInputChange(0, e.target.value)}
                  min={0}
                  max={1440}
                />
                <span className="text-sm text-gray-500">
                  {formatTime(localCookingTimeRange[0])}
                </span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <input
                  type="number"
                  placeholder="To"
                  className="input input-bordered input-sm w-20"
                  value={localCookingTimeRange[1]}
                  onChange={(e) => handleInputChange(1, e.target.value)}
                  min={0}
                  max={1440}
                />
                <span className="text-sm text-gray-500">
                  {formatTime(localCookingTimeRange[1])}
                </span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Rating */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              {lang("min-rating")}
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  className={`text-3xl ${
                    index < rating ? 'text-warning' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(index + 1)}
                >
                  ★
                </button>
              ))}
              <button
                className={`btn btn-sm ${
                  rating === 0 ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => setRating(0)}
              >
                {lang("all")}
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* Difficulty */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              {lang("difficulty")}
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  className={`btn btn-sm ${
                    selectedDifficulties[level] ? 'btn-primary' : 'btn-ghost'
                  }`}
                  onClick={() => handleCheckboxChange(level, !selectedDifficulties[level])}
                >
                  {lang(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* Have Made Toggle */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="text-gray-600 font-medium">{lang("haved-made")}</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={haveMadeOn}
                onChange={() => setHaveMadeOn(!haveMadeOn)}
              />
            </label>
          </div>

          <div className="divider"></div>

          {/* Hashtags */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              {lang("filter-by-hashtags")}
            </label>
            <input
              type="text"
              placeholder={lang("hashtag-placeholder")}
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              className="input input-bordered w-full"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map((hashtag, index) => (
                <span
                  key={index}
                  className="badge badge-primary badge-lg gap-2 cursor-pointer"
                  onClick={() => handleRemoveHashtag(hashtag)}
                >
                  {hashtag}
                  <span className="text-xs">✕</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>{lang("cancel")}</button>
          <button className="btn btn-primary" onClick={handleApplyFilters}>
            {lang("apply-filter")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterModal;
