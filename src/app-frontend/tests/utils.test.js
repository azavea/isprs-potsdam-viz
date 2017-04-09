import parseCurrentTime from '../js/common/utils';

test('parseCurrentTime method returns the correct key', () => {
    const mockData = {
        $id: "1",
        currentDateTime: "2016-12-16T13:27-05:00",
        currentFileTime: 131263684286867060,
        dayOfTheWeek: "Friday",
        isDayLightSavingsTime: false,
        ordinalDate: "2016-351",
        serviceResponse: null,
        timeZoneName: "Eastern Standard Time",
        utcOffset: "-05:00:00",
    };
    expect(parseCurrentTime(mockData)).toBe("2016-12-16T13:27-05:00");
});
