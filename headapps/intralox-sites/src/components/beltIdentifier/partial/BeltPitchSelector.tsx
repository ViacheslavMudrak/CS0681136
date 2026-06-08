import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import type {
  BeltPitchUnit,
  IFacetValue,
} from "./BeltIdentifierSearchResult.types";
import {
  ACTIVE_FACET_CLASS,
  BELT_PITCH_METRIC_FACET_NAME,
  BELT_PITCH_US_FACET_NAME,
} from "./BeltIdentifierSearchResult.utils";
import { Unit, UnitName } from "src/utils/enum";

interface BeltPitchSelectorProps {
  activeBeltPitchUnit: BeltPitchUnit;
  selectedBeltPitchValueId: string;
  beltPitchUsValues: IFacetValue[];
  beltPitchMetricValues: IFacetValue[];
  onUnitChange: (unit: BeltPitchUnit) => void;
  onPitchSelect: (facetName: string, pitchValueId: string) => void;
}

const BeltPitchSelector = ({
  activeBeltPitchUnit,
  selectedBeltPitchValueId,
  beltPitchUsValues,
  beltPitchMetricValues,
  onUnitChange,
  onPitchSelect,
}: BeltPitchSelectorProps) => (
  <>
    <div className="flex items-center mt-4 flex-row gap-2.5">
      <label
        className={`flex items-center gap-3 cursor-pointer ${
          activeBeltPitchUnit === Unit.INCH ? ACTIVE_FACET_CLASS : ""
        }`}
      >
        <input
          type="radio"
          name="belt-pitch-unit"
          checked={activeBeltPitchUnit === Unit.INCH}
          onChange={() => onUnitChange(Unit.INCH)}
          className="absolute opacity-0"
        />
        <span
          className={`radio-icon h-4 w-4 rounded-full ${
            activeBeltPitchUnit === Unit.INCH
              ? "border-4 border-stroke-input-focus"
              : "border border-stroke-default"
          }`}
        ></span>
        <span>{UnitName.US_UNITS}</span>
      </label>
      <label
        className={`flex items-center gap-3 cursor-pointer ${
          activeBeltPitchUnit === Unit.MILLIMETER ? ACTIVE_FACET_CLASS : ""
        }`}
      >
        <input
          type="radio"
          name="belt-pitch-unit"
          checked={activeBeltPitchUnit === Unit.MILLIMETER}
          onChange={() => onUnitChange(Unit.MILLIMETER)}
          className="absolute opacity-0"
        />
        <span
          className={`radio-icon h-4 w-4 rounded-full ${
            activeBeltPitchUnit === Unit.MILLIMETER
              ? "border-4 border-stroke-input-focus"
              : "border border-stroke-default"
          }`}
        ></span>
        <span>{UnitName.METRIC_UNITS}</span>
      </label>
    </div>
    <div className="flex md:flex-row flex-col w-full gap-4 mt-4 items-start">
      <div className="flex flex-col items-start gap-1 w-full">
        {(activeBeltPitchUnit === Unit.INCH
          ? beltPitchUsValues
          : beltPitchMetricValues
        ).map((pitchValue) => (
          <label
            key={pitchValue.id}
            className={`relative flex flex-wrap items-center w-full py-2 px-5 focus:outline-hidden focus-visible:ring focus-visible:rounded-sm! hover:bg-gray-200 active:bg-gray-300 disabled:text-gray-500 rounded-xs border ${
              selectedBeltPitchValueId === pitchValue.id
                ? "bg-stroke-input-focus border-stroke-input-focus hover:bg-stroke-input-focus text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <input
              type="radio"
              name="belt-pitch-range"
              className="absolute opacity-0"
              checked={selectedBeltPitchValueId === pitchValue.id}
              onChange={() =>
                onPitchSelect(
                  activeBeltPitchUnit === Unit.INCH
                    ? BELT_PITCH_US_FACET_NAME
                    : BELT_PITCH_METRIC_FACET_NAME,
                  pitchValue.id,
                )
              }
            />
            {selectedBeltPitchValueId === pitchValue.id && (
              <FontAwesomeIcon
                icon={faCheck}
                className="text-sm text-ink-surface absolute left-1 !ml-0"
              />
            )}
            <span className="text-base font-normal">
              {pitchValue.text}
              {activeBeltPitchUnit === Unit.INCH ? " in" : " mm"}
            </span>
          </label>
        ))}
      </div>
    </div>
  </>
);

export default BeltPitchSelector;
