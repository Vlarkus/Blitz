
import { describe, it, expect } from 'vitest';
import { importFromJerryIO } from './import-from-jerryio';

describe('importFromJerryIO', () => {
    it('should parse a valid JerryIO path file with multiple segments', () => {
        const fileContent = `#PATH-POINTS-START Path
-37.768, 2.445, 73.591
endData
#PATH.JERRYIO-DATA {"appVersion":"0.10.0","format":"LemLib Tarball v0.5","gc":{"robotWidth":12,"robotHeight":12},"paths":[{"segments":[{"controls":[{"uid":"start","x":0,"y":0,"__type":"end-point"},{"uid":"c1","x":10,"y":10,"__type":"control"},{"uid":"c2","x":20,"y":20,"__type":"control"},{"uid":"mid","x":30,"y":30,"__type":"end-point"}]},{"controls":[{"uid":"mid","x":30,"y":30,"__type":"end-point"},{"uid":"c3","x":40,"y":40,"__type":"control"},{"uid":"c4","x":50,"y":50,"__type":"control"},{"uid":"end","x":60,"y":60,"__type":"end-point"}]}],"pc":{},"name":"Path","uid":"Izfdf6gptW","lock":false,"visible":true}]}
`;
        const trajectories = importFromJerryIO(fileContent);

        expect(trajectories).toHaveLength(1);
        const t = trajectories[0];

        // Should have 3 points: Start(0,0), Mid(30,30), End(60,60)
        expect(t.controlPoints).toHaveLength(3);

        expect(t.controlPoints[0].x).toBe(0);
        expect(t.controlPoints[1].x).toBeCloseTo(30 * 0.0254);
        expect(t.controlPoints[2].x).toBeCloseTo(60 * 0.0254);
    });

    it('should throw error if marker is missing', () => {
        expect(() => importFromJerryIO('invalid content')).toThrow("Missing data marker");
    });
});
